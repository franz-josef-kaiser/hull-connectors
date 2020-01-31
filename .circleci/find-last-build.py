import sys
import json
import requests

# echo "finding last build in branch $BRANCH"
#
# page="$(curl --user $CIRCLE_TOKEN --request GET https://circleci.com/api/v1.1/project/github/hull/hull-connectors?filter=completed)"
# build=""
# length=$(echo "$page" | jq '. | length')
# while [ -z $build ]; do
#     jq -c '.[]' "$page" | while read elem; do
#     echo "iterrating over $elem"
#     if [ "$(echo "$elem" | jq -r '."branch"')" -eq "$BRANCH" ]; then
#       build=$(echo "$elem" | jq -r '."vcs_revision"')
#       echo "found build $build"
#     fi
#   done
#   build="hello"
# done


def read_page(branchName, token, offset):
    try:
        res = requests.get('https://circleci.com/api/v1.1/project/github/hull/hull-connectors?limit=100&filter=completed&apikey={token}&offset={offset}')
        if (res.content):
            return json.loads(res.content)
    except requests.exceptions.RequestException as e:
        return []
    return []


def get_last_build(branchName, token):
    offset = 0
    page = read_page(branchName, token, offset)
    if (not page):
        return ""
    build = ""
    while (not build):
        pageLen = len(page)
        if (pageLen):
            for elem in page:
                if (elem["branch"] == branchName):
                    build = elem["vcs_revision"]
        else:
            return ""
        offset += pageLen
        page = read_page(branchName, token, offset)
    return build


if __name__ == "__main__":
    print(get_last_build(sys.argv[1], sys.argv[2]))
