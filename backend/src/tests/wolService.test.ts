import { wakePC } from "../services/wolService";
import { isPCOnline } from "../services/statusCheckService";
import { exec } from "child_process";

jest.mock("child_process");
jest.mock("../services/statusCheckService");

describe("wakePC", () => {
  const mac = "00:11:22:33:44:55";
  const ip = "192.168.1.100";
  const netInterface = "eth0";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send a Wake-on-LAN packet and confirm the PC is online", async () => {
    (exec as jest.Mock).mockImplementation((command, callback) => {
      callback(null, "", "");
    });
    (isPCOnline as jest.Mock).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await wakePC(mac, ip, netInterface);

    expect(exec).toHaveBeenCalledWith(`ether-wake -i ${netInterface} ${mac}`, expect.any(Function));
    expect(isPCOnline).toHaveBeenCalledTimes(2);
    expect(isPCOnline).toHaveBeenCalledWith(ip, netInterface);
  });

  it("should retry if the PC is not online initially", async () => {
    (exec as jest.Mock).mockImplementation((command, callback) => {
      callback(null, "", "");
    });
    (isPCOnline as jest.Mock).mockResolvedValue(false);

    await expect(wakePC(mac, ip, netInterface, 3, 100)).rejects.toThrow("PC is not online after WoL");

    expect(exec).toHaveBeenCalledWith(`ether-wake -i ${netInterface} ${mac}`, expect.any(Function));
    expect(isPCOnline).toHaveBeenCalledTimes(3);
    expect(isPCOnline).toHaveBeenCalledWith(ip, netInterface);
  });

  it("should throw an error if sending the Wake-on-LAN packet fails", async () => {
    (exec as jest.Mock).mockImplementation((command, callback) => {
      callback(new Error("Failed to send WoL packet"), "", "");
    });

    await expect(wakePC(mac, ip, netInterface)).rejects.toThrow("Failed to send WoL packet");

    expect(exec).toHaveBeenCalledWith(`ether-wake -i ${netInterface} ${mac}`, expect.any(Function));
    expect(isPCOnline).not.toHaveBeenCalled();
  });
});
