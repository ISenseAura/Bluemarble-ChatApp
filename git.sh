#/bin/sh




#/bin/sh

# Fetch the newest code
git pull origin master

# Hard reset
git reset --hard origin/master

git remote set-head origin master

# Force pull
git pull origin master --force
