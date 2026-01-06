import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "provisioning-api/provisioning-rest-api",
    },
    {
      type: "category",
      label: "UNTAGGED",
      items: [
        {
          type: "doc",
          id: "provisioning-api/provisions-a-new-device-for-the-user",
          label: "Provisions a new device for the user",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
