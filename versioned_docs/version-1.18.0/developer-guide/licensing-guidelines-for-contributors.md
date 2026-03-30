---
sidebar_position: 13
---

# Licensing guidelines for contributors

All projects should include a `LICENSE.txt` text file in the root folder. This file should also be in the root of any distributed archive/ZIP file.

The `LICENSE.txt` file contains the whole text of the AGPL/GPL (or whatever license we think is appropriate for the project), and attribution for licenses of all components used in that project. Attribution means you add the name of the included component/project, and under which license it is used. You should also include the text of each dependent license.

Tip: use `./gradlew dependencies` on projects that use gradle as build tool.

In all source files (except where not appropriate such as property files or test fixtures), include a copyright header:

```
Copyright 2021, OpenRemote Inc.

See the CONTRIBUTORS.txt file in the distribution for a
full listing of individual contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
```

Contributors can add their name with an `@author` tag in Java source code of a class. Contributors should be included in the `CONTRIBUTORS.txt` file.
