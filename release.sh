# Cleanup
rm -rf *.log
rm -rf *.html
rm -rf *.png
rm -rf *.list

set -ex

# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=styrman

# image name
IMAGE=boozang-helper

# ensure we're up to date
git pull
# bump version
docker run --rm -v "$PWD":/app treeder/bump patch
version=`cat VERSION`
echo "version: $version"

major=`echo $version | cut -d. -f1`
minor=`echo $version | cut -d. -f2`
revision=`echo $version | cut -d. -f3`

# run build
./build.sh

# tag it
git add -A
git commit -m "version $version"
git tag -a "$version" -m "version $version"
git push
git push --tags

docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$version
docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$major
docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$major.$minor

# push it
docker push $USERNAME/$IMAGE:latest
docker push $USERNAME/$IMAGE:$version
docker push $USERNAME/$IMAGE:$major
docker push $USERNAME/$IMAGE:$major.$minor
