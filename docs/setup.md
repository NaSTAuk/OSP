# Setup

This file concerns setup after initial deployment.

## Admin account and password

By default an admin account is created for `tech@nasta.tv` when the OSP is first started. The password will be randomly genenrated and printed to the console. This should be changed ASAP as the method used to generate this password is not secure!

![Randomly generated password on first startup](./Startup_Password.png)

First-time startup will alo run a number of migrations to set up the awards and categories as well as to register a "NaSTA" station. Admin / host station accounts should be members of the "NaSTA" stations as it is set up to not be displayed to judges, and to be allowed to use all features of the system and enter all of the awards as many times as you would like.

The file `server/main.ts` contains all of these migrations.

## Adding users and changing passwords

From the admin screen click "Manage users". Expand the "tech@nasta.tv" user, enter a new password and click "Change Password".

To add a new user, enter their email and select their station from the stations list (again, NaSTA for admin accounts). You can choose whether or not to send the enrollment email immediately. This allows you to set up all the accounts for stations in advance, then send out the enrollment emails when the awards open. However, this is currently a manual process.

To change the roles assigned to a user, click on their account in the accounts table. By defualt they will have been given the station role, this only allows them to enter awards. Judges should have the "Judge" role and no other roles. Hosts should have the "Host" role an no other roles. The "editor" role allows access to the video downloads page, and nothing else. Only hosts and admins can see all of the entries and results.

## Match judges to awards

Navigate to `/manage/judges` and you'll see a list of all the judges. Click on the dropdown next to a judge's account and select the award to assign to them and hit save (sorry, you have to click save for every judge after every change). A category can have multiple judges but each account can only be assigned to a single category.

## Adding stations

Navigate to `/manage/stations` and you can add / remove stations.

## Opening / closing awards

To allow people to enter the awards, navigate to `/manage/awards` and check the "Awards Open" box under each award that should be open. Uncheck to close.
