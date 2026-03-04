---
sidebar_position: 3
---

# GOPACS Integration

[GOPACS](https://www.gopacs.eu/) (Grid Operators Platform for Ancillary Services) is a platform operated by Dutch grid operators (DSOs and TSO) to resolve grid congestion through flexibility trading. When the electricity grid is at risk of overloading, GOPACS sends flexibility requests to market participants (aggregators) who can adjust their energy consumption or production to relieve congestion.

The communication between GOPACS and market participants uses the **UFTP** (Universal Flexibility Trading Protocol), part of the [USEF](https://www.usef.energy/) framework. For detailed GOPACS documentation, see: [GOPACS documents and manuals](https://www.gopacs.eu/en/documents-and-manuals/)

## Prerequisites

To participate in GOPACS flex trading through OpenRemote, you need:

1. **A GOPACS account** — Register as a Trading Company at [gopacs.eu](https://www.gopacs.eu/)
2. **OAuth2 client credentials** (`client_id` and `client_secret`) — See [OAuth2 Client Credentials for API Clients](https://www.gopacs.eu/wp-content/uploads/2025/12/GOPACS-OAuth2-Client-credentials-for-API-Clients-03-12-2025.pdf)
3. **A signing key pair** — An Ed25519 private key file for signing UFTP messages. The corresponding public key must be registered with GOPACS
4. **A contracted EAN** — The EAN (European Article Number) identifying your grid connection point, as agreed with your DSO

## Configuration

The following environment variables must be set on the OpenRemote manager:

| Variable | Required | Description |
| --- | --- | --- |
| `GOPACS_PRIVATE_KEY_FILE` | Yes | File path to the Ed25519 private key for signing UFTP messages |
| `GOPACS_CLIENT_ID` | Yes | OAuth2 client ID from GOPACS |
| `GOPACS_CLIENT_SECRET` | Yes | OAuth2 client secret from GOPACS |
| `GOPACS_PARTICIPANT_URL` | No | Address book base URL (default: `https://clc-message-broker.gopacs-services.eu`) |
| `GOPACS_OAUTH2_URL` | No | OAuth2 token endpoint (default: `https://auth.gopacs-services.eu/realms/gopacs/protocol/openid-connect/token`) |
| `GOPACS_RESPONSE_DELAY_SECONDS` | No | Delay before auto-responding to messages (default: `10`) |
| `GOPACS_FLEX_OFFER_DELAY_SECONDS` | No | Delay before sending a flex offer (default: `30`) |

## Asset setup

In OpenRemote, create an **EMS GOPACS Asset** as a child of an **EMS Energy Optimisation Asset** and set the `contractedEAN` attribute to your grid connection's EAN. This can also be done by enabling the "Include GOPACS" attribute on the **EMS Energy Optimisation Asset**.

For more on setting up the Energy Management System, see [Energy Management](create-your-energy-management-system.md).

## Testing

GOPACS provides a dedicated testing environment. See [Testing UFTP API Flex Messages](https://www.gopacs.eu/wp-content/uploads/2025/12/GOPACS-Testing-receiving-and-sending-flex-messages-by-UFTP-testing-functionality-04-12-2025.pdf) for their guide on sending and receiving flex messages via the UFTP testing functionality.

For additional context on the protocol and contract types, see [Flex Trading with CSC and ATR (UFTP Messages)](https://www.gopacs.eu/wp-content/uploads/2026/02/GOPACS-Flex-trading-with-Capacity-Limiting-Contracts-using-UFTP-messages-11-02-2026.pdf).

To configure your Trading Company for testing Capacity Steering Contracts, follow: [Company Settings for CSC Participation](https://www.gopacs.eu/wp-content/uploads/2025/06/GOPACS-Company-settings-for-participating-in-CSC-Capacity-Steering-Contracts.pdf)

## Developer documentation

For details on the source code components, inbound endpoint, authentication internals, and ISP handling, see the [GOPACS developer guide](../../developer-guide/gopacs-integration.md).
