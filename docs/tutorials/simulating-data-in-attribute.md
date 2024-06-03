---
sidebar_position: 6
---

# Simulating data in attribute

If you don't have a data connection running yet or want to simulate the behaviour of an attribute, you can use the Simulator Agent to replay data. To do that, take the following steps:
1. Add the 'Simulator Agent' to your system.
2. Add the configuration 'Agent link' to the attribute you want to replay data for.
3. Select the 'SimulatorAgentLink'.

![SimulatorAgentLink](img/simulator-agent-link.png)

4. Open the 'Replay data' JSON for this attribute and add a number and the related timestamps (seconds) for a 24hr time period.

![Replay data](img/replay-data.png)

5. You will now see the attribute replaying the filled in data.
