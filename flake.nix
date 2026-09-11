{
  description = "agilestory.blog development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = [ pkgs.nodejs_24 pkgs.yarn-berry ];
          shellHook = ''
            export COREPACK_ENABLE_STRICT=0
            echo "node $(node --version) / yarn $(yarn --version)"
          '';
        };
      });
}
