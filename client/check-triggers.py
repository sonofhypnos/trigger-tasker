import requests
import time
import datetime
from datetime import timezone

CLOUD_FUNCTION_URL = (
    "https://us-central1-androidhooks-70c5d.cloudfunctions.net/checkTriggers"
)
CHECK_INTERVAL = 5  # seconds

last_time_stamp = 0


def check_for_triggers():
    response = requests.get(CLOUD_FUNCTION_URL)
    if response.status_code == 200:
        triggers = response.json()
        for trigger in triggers:
            process_trigger(trigger)
        global last_time_stamp
        last_time_stamp = datetime.datetime.now().timestamp() * 1000
        print(f"last_timestamp: {last_time_stamp}")


def process_trigger(trigger):
    timestamp = trigger["timestamp"]
    if timestamp > last_time_stamp:
        print(timestamp)
        action = trigger["action"]
        params = trigger["params"]

        if action == "break":
            print("It is time to take a break!")
        if action == "aTimeLogger_start_activity":
            activity_name = params["name"]
            activity_start_timestamp = params["start_utc"]

        # Add more actions as needed


def main():
    while True:
        check_for_triggers()
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
