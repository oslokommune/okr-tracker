# Why we are not using Oslo Designsystem

We are not using the package Oslo designsystem yet because it is hosted on Github Package Registry and not NPM Registry.

For okr-tracker to actually access the package from github registry, we would need to a token to our npmrc, both on the ci/cd pipeline and all of the developers using okr-tracker. This is not ideal for this open source project, so until Oslo kommune adds their designsystem to the npm registry, we will copy some of the design and write it ourselves.
