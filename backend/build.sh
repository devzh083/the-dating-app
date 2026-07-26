#!/usr/bin/env bash
# Render build command: bash build.sh
set -o errexit

pip install -r requirements.txt

# --upload-unhashed-files: cloudinary_storage's collectstatic override skips
# copying files unless this flag is passed or STATICFILES_STORAGE points at
# its own StaticCloudinaryStorage — we use plain local static storage served
# by WhiteNoise instead, so this flag is required every time.
python manage.py collectstatic --noinput --upload-unhashed-files

python manage.py migrate
