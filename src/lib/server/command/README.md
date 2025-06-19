# command

This directory contains all of the application's "commands" (aka write operations).
All potential user interfaces (mobile app, REST API, etc) would still use this single set of commands.

TODO: Should "admin-only account required" be enforced within commands? Or just the UI layer?
TODO: Should commands accept an extra "who" parameter that indicates which accoutn is performing the action?
