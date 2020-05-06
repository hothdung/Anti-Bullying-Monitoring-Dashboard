import json
import random

json_file = open("data/warningSampleInput.json", "r")
json_object = json.load(json_file)
json_file.close()

for i in json_object:
    print(round(random.uniform(0, 0), 2))
    i["warningMax"] = round(random.uniform(0, 0), 2)

json_file = open("data/warningSample_individual24.json", "w")
json.dump(json_object, json_file)
json_file.close()
