import { exec } from "child_process";
import { isPCOnline } from "./statusCheckService";
import logger from "../utils/logger"; // Import the logger

export async function wakePC(
  mac: string,
  ip: string,
  netInterface: string,
  retries = 10,
  delay = 5000,
): Promise<void> {
  // Step 1: Send Wake-on-LAN packet using ether-wake
  logger.info(`Attempting to wake PC with MAC: ${mac} via ${netInterface}`);
  
  await new Promise<void>((resolve, reject) => {
    const command = `ether-wake -i ${netInterface} ${mac}`;
    logger.debug(`Executing command: ${command}`);

    exec(command, (error, _stdout, stderr) => {
      if (error) {
        logger.error(`Failed to send WoL packet: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        logger.warn(`ether-wake stderr: ${stderr}`);
      }
      logger.info(`WoL packet sent successfully`);
      resolve();
    });
  });

  // Step 2: Poll until the PC is online using the status check
  logger.info(`Polling to check if PC is online at ${ip}...`);
  
  let online = false;
  for (let i = 0; i < retries; i++) {
    online = await isPCOnline(ip, netInterface);
    if (online) {
      logger.info(`PC (${ip}) is now online.`);
      return;
    }
    logger.warn(`PC (${ip}) is not online yet. Retrying (${i + 1}/${retries})...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!online) {
    logger.error(`PC (${ip}) did not come online after ${retries} retries.`);
    throw new Error(`PC is not online after WoL`);
  }
}
