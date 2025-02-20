---
sidebar_position: 8
---

# Simulator

Simulate a connection to an external service, useful during development when the real service is un-available etc. It can also be used to automatically replay a fixed set of simulated values over a repeating 24h period.


## Agent configuration
There is no configuration required on the agent for this protocol.


## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `SimulatorAgentLink`) | Y |
| `replayData` | 24h dataset of values that should be replayed (i.e. written to the linked attribute) in a continuous loop | [SimulatorReplayDatapoint[]](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/simulator/SimulatorReplayDatapoint.java) | N |

## Additional info
Attributes linked to this agent that are written to will follow a route through the system as if it came from a remote service.

### Simulator Replay Datapoints
Attributes linked to this agent that have a `replayData` field in their Agent Link will cause the values within to be replayed over a 24h period in a continuous loop. Each SimulatorReplayDatapoint value must have a `timestamp` (seconds offset from midnight `00:00` in the system time of the machine that hosts the manager) and a `value`, this value will then be written to the attribute at the specified seconds offset from midnight each day.
