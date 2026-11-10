#!/usr/bin/env bash
# 사이트 조립: bash build.sh [출력 폴더]   (기본 _site)
set -euo pipefail
out="${1:-_site}"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$out/sim"
tail='</script>\n</body>\n</html>\n'
{ cat "$here"/src/gen/head.html "$here"/src/gen/draw.js "$here"/src/gen/trad.js "$here"/src/gen/roller.js "$here"/src/gen/ui.js; printf "$tail"; } > "$out/index.html"
{ cat "$here"/src/sim/head.html "$here"/src/sim/data.js "$here"/src/sim/core.js "$here"/src/sim/ui.js; printf "$tail"; } > "$out/sim/index.html"
touch "$out/.nojekyll"
echo "built: $out/index.html, $out/sim/index.html"
