FROM postgres:17.4-alpine AS build
RUN apk add curl tar make && \
  curl -L  https://github.com/michelp/pgjwt/tarball/master -o pgjwt.tgz && \
  tar zxf pgjwt.tgz && \
  mv michelp-pgjwt-* pgjwt && \
  cd pgjwt && \
  make

FROM postgres:17.4-alpine
COPY docker-healthcheck /usr/local/bin/
COPY --from=build /pgjwt /pgjwt
RUN cd /pgjwt && \
  /usr/local/lib/postgresql/pgxs/config/install-sh -c -d '/usr/local/share/postgresql/extension' && \
  /usr/bin/install -c -m 644 ./pgjwt.control ./pgjwt--*.sql '/usr/local/share/postgresql/extension/'
HEALTHCHECK CMD ["docker-healthcheck"]
