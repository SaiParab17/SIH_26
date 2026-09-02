import os
import shutil
import tempfile
import zipfile
import requests
import orjson
from pathlib import Path
from platformdirs import user_cache_dir

# 1. Paths
INSTALL_DIR = Path(user_cache_dir("camoufox"))
BROWSERS_DIR = INSTALL_DIR / "browsers"
CONFIG_FILE = INSTALL_DIR / "config.json"
COMPAT_FLAG = INSTALL_DIR / ".0.5_FLAG"

repo_name = "official"
build_str = "beta.30"
version_str = "152.0.4"
folder_name = f"{version_str}-{build_str}"
install_path = BROWSERS_DIR / repo_name / folder_name

url = f"https://github.com/daijro/camoufox/releases/download/v{folder_name}/camoufox-{folder_name}-win.x86_64.zip"

print(f"Downloading Camoufox from: {url}")
r = requests.get(url, stream=True)
r.raise_for_status()

with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
    tmp_path = Path(tmp.name)
    for chunk in r.iter_content(chunk_size=8192):
        tmp.write(chunk)

print(f"Downloaded zip to temporary file: {tmp_path}")

# Extract zip
if install_path.exists():
    shutil.rmtree(install_path)

install_path.mkdir(parents=True, exist_ok=True)

print(f"Extracting to {install_path}...")
with zipfile.ZipFile(tmp_path, 'r') as zip_ref:
    zip_ref.extractall(install_path)

tmp_path.unlink()

# Write version.json in install_path
version_data = {
    'version': version_str,
    'build': build_str,
    'prerelease': True,
    'created_at': '2026-09-01T00:00:00Z'
}
(install_path / 'version.json').write_bytes(orjson.dumps(version_data))

# Update config.json
config = {}
if CONFIG_FILE.exists():
    try:
        config = orjson.loads(CONFIG_FILE.read_bytes())
    except Exception:
        pass

config['active_version'] = f"browsers/{repo_name}/{folder_name}"
INSTALL_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_FILE.write_bytes(orjson.dumps(config, option=orjson.OPT_INDENT_2))

# Touch COMPAT_FLAG
COMPAT_FLAG.touch()

print("Camoufox installation complete!")

# Verify using camoufox package APIs
from camoufox.pkgman import camoufox_path, installed_verstr, launch_path
print("Camoufox Path:", camoufox_path())
print("Installed Verstr:", installed_verstr())
print("Launch Executable Path:", launch_path())
