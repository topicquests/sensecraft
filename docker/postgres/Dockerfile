FROM postgres:15.4-alpine
RUN apk add curl tar make && curl -L  https://github.com/michelp/pgjwt/tarball/master -o pgjwt.tgz && tar zxf pgjwt.tgz && (cd michelp-pgjwt-* && make install) && rm -rf michelp-pgjwt-*
