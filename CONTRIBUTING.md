# General guidelines

All modules should

* Have adequate unit tests
* Not contain any outside dependencies
* Not write log messages unless they are part of the core functionality (see SelectionHelper). Throw Errors instead.
* Have a written documentation
* Not contain any project-specific code or logic