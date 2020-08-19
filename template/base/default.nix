{ pkgs ? import <nixpkgs> {}
}:
pkgs.mkShell {
  name = "{{name}}-environment";
  buildInputs = [
    pkgs.nodejs-14_x
    pkgs.postgresql_12
  ];
  shellHook = ''
    export PGDATA=./db/content
    export PGDATABASE={{name}}
    export PGPORT=5454
    export PGSSLMODE=disable
  '';
}
