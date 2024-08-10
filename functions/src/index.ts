import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface TriggerData {
  action: string;
  params: Record<string, any>;
}

export const triggerAction = functions.runWith({
  timeoutSeconds: 10,
  memory: "128MB",
  maxInstances: 1,
}).https.onRequest(
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {action, params} = request.body as TriggerData;

    if (!action) {
      response.status(400).send("Missing action");
      return;
    }


    try {
      const trigger = {
        action,
        params,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      };
      await admin.database().ref("triggers").push(trigger);
      response.status(200).send("Trigger stored successfully");
    } catch (error) {
      console.error("Error storing trigger:", error);
      response.status(500).send("Error storing trigger");
    }
  });

interface Trigger extends TriggerData {
  id: string;
  timestamp: number;
}

export const checkTriggers = functions.runWith({
  timeoutSeconds: 10,
  memory: "128MB",
  maxInstances: 1,
}).https.onRequest(
  async (request, response) => {
    if (request.method !== "GET") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const snapshot = await admin.database().ref("triggers")
        .orderByChild("timestamp")
        .limitToLast(10)
        .once("value");

      const triggers: Trigger[] = [];
      snapshot.forEach((childSnapshot) => {
        triggers.push({
          id: childSnapshot.key as string,
          ...(childSnapshot.val() as Omit<Trigger, "id">),
        });
      });
      response.status(200).json(triggers);
    } catch (error) {
      console.error("Error fetching triggers:", error);
      response.status(500).send("Error fetching triggers");
    }
  });
