import { makeAuthPlugin } from "../boot/feathersClient";

export default makeAuthPlugin({ memberService: "members" });
