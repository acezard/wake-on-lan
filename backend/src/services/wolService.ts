import { exec } from "child_process";
import { isPCOnline } from "./statusCheckService";

export async function wakePC(
  mac: string,
  ip: string,
  netInterface: string,
  retries = 10,
  delay = 5000,
): Promise<void> {
  // Step 1: Send Wake-on-LAN packet using ether-wake
  console.log(`Sending WoL packet to MAC: ${mac} via ${netInterface}`);
  await new Promise<void>((resolve, reject) => {
    const command = `ether-wake -i ${netInterface} ${mac}`;
    console.log(`Executing command: ${command}`);

    exec(command, (error, _stdout, stderr) => {
      if (error) {
        console.error(`Failed to send WoL packet: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.log(`ether-wake stderr: ${stderr}`);
      }
      console.log(`WoL packet sent successfully`);
      resolve();
    });
  });

  // Step 2: Poll until the PC is online using the generic status check
  console.log(`Polling to check if PC is online...`);
  let online = false;
  for (let i = 0; i < retries; i++) {
    online = await isPCOnline(ip);
    if (online) {
      console.log(`PC is now online.`);
      return;
    }
    console.log(`PC is not online yet. Retrying (${i + 1}/${retries})...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!online) {
    throw new Error(`PC is not online after WoL`);
  }
}
