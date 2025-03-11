import argparse
from collections import defaultdict
from datetime import datetime, timedelta

import requests
import yaml

full_headers = dict(Prefer="return=representation")

def get_token(email, password, url):
    r = requests.post(f'{url}rpc/get_token', data={'mail': email, 'pass': password})
    assert r.ok
    return {"Authorization": "Bearer "+r.text.strip('"')}

def get_handle_token(config, handle):
    data = config['members'][handle]
    return get_token(data['email'], data['password'], config['api']['url'])

def get_admin_token(config):
    return get_token(config['api']['admin_email'], config['api']['admin_password'], config['api']['url'])

def reset_data(config):
    print('resetting data')
    url = config['api']['url']
    admin_headers = get_admin_token(config)
    quests = {x['handle']: x['id'] for x in requests.get(f"{url}public_quests", headers=admin_headers).json()}
    for h, data in config['quests'].items():
        if h in quests:
            print(f"Deleting quest: {h}")
            r = requests.delete(f"{url}conversation_node?quest_id=eq.{quests[h]}", headers=admin_headers)
            assert r.ok
            creator_headers = get_handle_token(config, data['creator'])
            r = requests.delete(f"{url}quests?id=eq.{quests[h]}", headers=admin_headers)
            assert r.ok
    guilds = {x['handle']: x['id'] for x in requests.get(f"{url}public_guilds", headers=admin_headers).json()}
    for h, data in config['guilds'].items():
        if h in guilds:
            print(f"Deleting guild: {h}")
            creator_headers = get_handle_token(config, data['creator'])
            r = requests.delete(f"{url}guilds?id=eq.{guilds[h]}", headers=creator_headers)
            assert r.ok
    # members = {x['handle']: x['id'] for x in requests.get(f"{url}public_members", headers=admin_headers).json()}
    # ids = {str(id) for h, id in members.items() if h in config['members']}
    # if ids:
    #   r = requests.delete(f"{url}members?id=in.({','.join(ids)})", headers=admin_headers)
    #   assert r.ok

def ensure_members(config):
    url = config['api']['url']
    admin_headers = get_admin_token(config)
    r = requests.get(f'{url}members', headers=admin_headers)
    existing = {x['handle']: x for x in r.json()}
    admin_headers = get_admin_token(config)
    for handle, data in config['members'].items():
        if handle not in existing:
            print(f"Adding missing member: {handle}")
            data |= dict(handle=handle, name=data.get('name', handle), permissions=data.get('permissions', []))
            r = requests.post(f"{url}rpc/create_member", data=data)
            assert r.ok
            data = r.json()[0]
            existing[handle] = data
            existing_data = data
        else:
            existing_data = existing[handle]
        if (set(existing_data['permissions']) != set(data['permissions'])) or not existing_data.get('confirmed', False):
            print(f"Updating permissions for member {handle}: {existing_data['permissions']} => {data['permissions']}")
            r = requests.patch(f"{url}members?id=eq.{existing[handle]['id']}", json=dict(confirmed=True, permissions=data['permissions']), headers=admin_headers)
            assert r.ok
            existing_data['permissions'] = data['permissions']
    return {h: x['id'] for h, x in existing.items()}


def get_role_ids(config):
    url = config['api']['url']
    admin_headers = get_admin_token(config)
    r = requests.get(f'{url}role', headers=admin_headers)
    assert r.ok
    return {x['name']: x['id'] for x in r.json()}

def ensure_guilds(config, member_ids, role_ids, quest_data):
    url = config['api']['url']
    admin_headers = get_admin_token(config)
    r = requests.get(f'{url}public_guilds?select=*,guild_membership!guild_id(*),casting_role!guild_id(*),casting!guild_id(*),game_play!guild_id(*),guild_member_available_role!guild_id(*)', headers=admin_headers)
    assert r.ok
    existing = {x['handle']: x for x in r.json()}
    for handle, data in config['guilds'].items():
        creator_handle = data['creator']
        creator_data = config['members'][creator_handle]
        creator_header = get_handle_token(config, creator_handle)
        creator_id = member_ids[creator_handle]
        # Ensure the guild itself
        gdata = {k: v for k, v in data.items() if k in ('description', 'name')}
        gdata |= dict(handle=handle, creator=member_ids[creator_handle], name=gdata.get('name', handle))
        if handle not in existing:
            print(f"Adding missing guild: {handle}")
            r = requests.post(f"{url}guilds", json=gdata, headers=creator_header|full_headers)
        else:
            r = requests.patch(f"{url}guilds?id=eq.{existing[handle]['id']}", json=gdata, headers=creator_header|full_headers)
        assert r.ok
        gdata = r.json()[0]
        existing[handle] = existing.get(handle, {}) | gdata
        existing_data = existing[handle]
        guild_id = existing_data['id']
        available_role_by_member = defaultdict(list)
        for available_role in existing_data.get('guild_member_available_role', []):
            available_role_by_member[available_role['member_id']].append(available_role)
        casting_role_by_member_and_quest = defaultdict(lambda: defaultdict(list))
        for casting_role in existing_data.get('casting_role', []):
            casting_role_by_member_and_quest[casting_role['member_id']][casting_role['quest_id']].append(casting_role)
        casting_by_member_and_quest = defaultdict(lambda: defaultdict(list))
        for casting in existing_data.get('casting', []):
            casting_by_member_and_quest[casting['member_id']][casting['quest_id']].append(casting)
        game_plays_by_quest = defaultdict(list)
        for game_play in existing_data.get('game_play', []):
            game_plays_by_quest[game_play['quest_id']].append(game_play)
        role_id = role_ids['Game leader']
        # Ensure guild creator can be game leader
        if role_id not in {x['role_id'] for x in available_role_by_member[creator_id]}:
            r = requests.post(f"{url}guild_member_available_role", headers=creator_header,
                              json=dict(guild_id=guild_id, role_id=role_id, member_id=creator_id))
            assert r.ok
        for quest_handle in config['quests']:
            quest_id = quest_data[quest_handle]['id']
            # Ensure game_plays
            if quest_id not in game_plays_by_quest:
                r = requests.post(f"{url}game_play", headers=creator_header,
                                  json=dict(guild_id=guild_id, quest_id=quest_id, status='confirmed', game_status='confirmed'))
                assert r.ok
            # Ensure guild creator is playing each quest
            if creator_id not in {x['member_id'] for x in casting_by_member_and_quest[creator_id][quest_id]}:
                r = requests.post(f"{url}casting", headers=creator_header,
                                  json=dict(guild_id=guild_id, quest_id=quest_id, member_id=creator_id))
                assert r.ok
            # Ensure guild creator is game leader for each quest
            if role_id not in {x['role_id'] for x in casting_role_by_member_and_quest[creator_id][quest_id]}:
                r = requests.post(f"{url}casting_role", headers=creator_header,
                                  json=dict(guild_id=guild_id, quest_id=quest_id, role_id=role_id, member_id=creator_id))
                assert r.ok
        # Other members
        for member_handle, member_data in data.get('members', {}).items():
            member_id = member_ids[member_handle]
            member_header = get_handle_token(config, member_handle)
            # Ensure membership
            if member_id not in {x['member_id'] for x in existing_data['guild_membership']}:
                print(f"Adding missing member {member_handle} to guild {handle}")
                r = requests.post(f"{url}guild_membership", headers=member_header,
                                  json=dict(member_id= member_id, guild_id=guild_id))
                assert r.ok
            # Ensure can play those roles
            for role in member_data['roles']:
                role_id = role_ids[role]
                if role_id not in {x['role_id'] for x in available_role_by_member[member_id]}:
                    r = requests.post(f"{url}guild_member_available_role", headers=creator_header,
                                      json=dict(guild_id=guild_id, role_id=role_id, member_id=member_id))
                    assert r.ok
            for quest_handle in config['quests']:
                quest_id = quest_data[quest_handle]['id']
                # Ensure member playing each quest
                if member_id not in {x['role_id'] for x in casting_by_member_and_quest[member_id][quest_id]}:
                    r = requests.post(f"{url}casting", headers=member_header,
                                      json=dict(guild_id=guild_id, quest_id=quest_id, member_id=member_id))
                    assert r.ok
                # Ensure members plays all the roles in the quest
                for role in member_data['roles']:
                    role_id = role_ids[role]
                    if role_id not in {x['role_id'] for x in casting_role_by_member_and_quest[member_id][quest_id]}:
                        r = requests.post(f"{url}casting_role", headers=creator_header,
                                          json=dict(guild_id=guild_id, quest_id=quest_id, role_id=role_id, member_id=member_id))
                        assert r.ok
    return existing

def ensure_quests(config, member_ids):
    url = config['api']['url']
    admin_headers = get_admin_token(config)
    r = requests.get(f'{url}quests', headers=admin_headers)
    assert r.ok
    existing = {x['handle']: x for x in r.json()}
    for handle, data in config['quests'].items():
        creator_handle = data['creator']
        creator_data = config['members'][creator_handle]
        creator_header = get_handle_token(config, creator_handle)
        data = {k: v for k, v in data.items() if k in ('description', 'name', 'turn_based')}
        data |= dict(handle=handle, creator=member_ids[creator_handle], start=datetime.utcnow().isoformat(), end=(datetime.utcnow()+timedelta(days=1)).isoformat(), status='ongoing')
        if handle not in existing:
            print(f"Adding missing quest: {handle}")
            r = requests.post(f"{url}quests", json=data, headers=creator_header|full_headers)
        else:
            r = requests.patch(f"{url}quests?id=eq.{existing[handle]['id']}", json=data, headers=creator_header|full_headers)
        assert r.ok
        existing[handle] = r.json()[0]
        print(f"/quest/{existing[handle]['id' ]}")

    return existing


def run(dataa, config, quests, guilds, member_ids):
    url = config['api']['url']
    nodes = {}
    creators = {}
    for data in dataa:
        print(data)
        r = input()
        if r == 's':
            next
        if 'quest_id' in data:
            data['quest_id'] = quests[data['quest_id']]['id']
        if 'guild_id' in data:
            data['guild_id'] = guilds[data['guild_id']]['id']
        nid = None
        if 'id' in data:
            lid = data.pop('id')
            nid = nodes[lid]
        else:
            lid = data.pop('lid')
        if 'parent_id' in data:
            data['parent_id'] = nodes[data['parent_id']]
        member_handle = data.pop('acting_member', None)
        if not member_handle:
            member_handle =  data.get('creator_id', creators.get(lid, None))
            assert member_handle
            data['creator_id'] = member_ids[member_handle]
        headers = get_handle_token(config, member_handle)
        if nid:
            print(data)
            r = requests.patch(f"{url}conversation_node?id=eq.{nid}", json=data, headers=headers)
            assert r.ok, r.text
        else:
            headers["Prefer"] = "return=representation"
            r = requests.post(f"{url}conversation_node", json=data, headers=headers|full_headers)
            assert r.ok, r.text
            nodes[lid] = r.json()[0]['id']
            creators[lid] = member_handle


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Demo driver')
    parser.add_argument('-c', '--config', type=str, help='Config file', default="demo_config.yaml")
    parser.add_argument('-d', '--demo_file', type=str, help='Demo file to read')
    parser.add_argument('-r', '--reset', action='store_true', help='Reset existing data')
    args = parser.parse_args()
    with open(args.demo_file, 'r') as f:
        data = yaml.full_load(f)
    with open(args.config, 'r') as f:
        config = yaml.full_load(f)
    try:
        if args.reset:
            reset_data(config)
        member_ids = ensure_members(config)
        role_ids = get_role_ids(config)
        quest_data = ensure_quests(config, member_ids)
        guild_data = ensure_guilds(config, member_ids, role_ids, quest_data)
        run(data, config, quest_data, guild_data, member_ids)
    except Exception as e:
        print(f"Error: {e}")
        import pdb
        pdb.post_mortem()
