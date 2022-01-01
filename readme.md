Duelers - Overlay Minigame - Twitch Channel Points Hackathon
============================================================

Duelers: An overlay minigame with Twitch Channel Points Integration where
viewers can duel others as fighters on stream.

Note: If you're looking for the unchanged hackathon submission,
[go here](https://github.com/jayther/hackathon-overlay-minigame/releases/tag/v0.1.0)
(https://github.com/jayther/hackathon-overlay-minigame/releases/tag/v0.1.0)

# Features

* Game in a widget (overlay in a browser source)
* Sounds and music
* Viewers can duel each other through channel points
* Control Panel for duel and fighter management and settings
* Channel Points Integration
  * Redeem to spawn as a fighter, duel other viewers, and dance
  * Create required rewards or use existing rewards for functionality through
    Control Panel
  * "Spawn", "dance", and "run around" redemptions are automatically approved
    if successful, or automatically reject/refund if not
  * Optionally change fighter type and gender through channel points (instead
    of through chat commands)
  * Optionally start or cancel duels from Twitch's Rewards Requests Queue
* Chat Integration
  * When a redeem action fails (i.e., spawn a fighter when already in the
    game), it will refund the points and notify in chat
  * Chat notification when duel is about to start
  * Change fighter type and gender through chat commands
    * `!char [type]` to change character type
    * `!gender [male/female]` to change gender
    * `!chars` to list all available types

# Tech stack

* NodeJS
* Webpack to build Control Panel, game, and Widget
* Express for web server
* Socket.io for communication between server, control panel, and widget
* React for user interface (control panel, widget)
* Twitch JS library to interface with Twitch API
* ngrok and twitch-eventsub-ngrok to facilitate secure requests from Twitch to
  the local server
* Howler library for sound management
* Sass for building CSS files
* Bootstrap 4 for Control Panel styling

# Setup

For dev or locally running. Currently only setup for local.

## ngrok

1. Go to [ngrok's download page](https://ngrok.com/download) (https://ngrok.com/download) and download
2. Install `ngrok`
3. [Create an account at ngrok](https://dashboard.ngrok.com/signup)
   (https://dashboard.ngrok.com/signup) (It's free!)
4. Follow the instructions in their
   [authtoken page](https://dashboard.ngrok.com/get-started/your-authtoken)
   (https://dashboard.ngrok.com/get-started/your-authtoken)

## Twitch API Keys

1. Create an application at dev.twitch.tv console
2. Put in a name
3. Put in these as OAuth Redirect URLs:
    * `http://localhost:8080/callback`
    * `http://localhost:8080/chatbot`
4. For **Category**, choose **Game Integration**
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

## Your computer

1. Clone repo
2. `npm install`
3. `npm run build`
4. `npm run server`
5. Go to `http://localhost:8080` in a browser (Control Panel)
6. Follow instructions in control panel:
    1. Put in **Client ID** and **Client Secret** when requested
    2. Click "Start Authorization" to log into your Twitch account
    3. After logging in and allowing the app, go back to Control Panel
    4. For the chatbot, click "Start Authorization" to log into your
        chatbot's Twitch account (maybe open in incognito or a different
        browser)
          * Optionally, you can use your Twitch account and the game will chat
            in your behalf
7. After chatbot connects to chatand the events are subscribed, it is ready!

## Widget (browser source overlay, the actual game)

1. In OBS or Streamlabs OBS, add a new Browser source.
2. Disable **Local File**
2. Put `http://localhost:8080/widget.html` in the URL box.
3. Set desired Width and Height. Optimized for 1280x720 dimensions, but can be
   any size and the fighters and
   arena will adjust accordingly.
4. Advisable to enable **Control audio via OBS**
5. Keep default custom CSS:
   ```css
   body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }
   ```
6. Disable **Shutdown source when not visible**
7. Disable **Refresh browser when scene becomes active**

Also, advisable to only have the one browser source (referenced between
scenes), as battles are decided by the widget, not the server.

# Control Panel

Accessible at `http://localhost:8080` . Start duels, change settings, manage
fighters, and manage rewards in the control panel.

## Home tab

Home tab contains both Duels and Players panels (minus Duel settings).

## Players tab

View player's/fighter's settings, and manually change player settings,
request duels, and remove.

* **Add Debug Player**: Adds a mock fighter in the game with a randomized mock
  username.
* **Show/Hide All Actions**: Expands/Collapses every player's "Actions"
  section.
* Player stats:
  * **Username**: The player's username.
  * **K/D/T**: Kills/deaths/ties (ties currently not used).
  * **WS**: Current win streak without dying.
  * **Type**: The fighter character type.
  * **Gender**: The fighter's gender.
  * **Weapon**: Whether or not they have a weapon equipped.
  * **Actions**: Show/hide player's actions section.
* Player actions section:
  * **Change Type**: Change character type (rotation of 17 characters).
  * **Change Gender**: Swap between male and female.
  * **Run Around**: Fighter runs around (as in the "run around" reward).
  * **Dance**: Fighter dances (as in the "dance" reward).
  * **Toggle Weapon**: Toggles weapon.
  * **Request Battle**: Requests a duel with random fighter.
  * **Specific Battle**: Requests a duel with the chosen fighter (dropdown
    contains players that are currently in game).
  * **Remove**: Removes the fighter from the game.

## Duels tab

* Duels tab contains the Duel requests, as well as the current duel and last
  duel results.
    * When there is a duel request, click **Start** to start the duel and
      approve the redemption, or click **Cancel** to cancel the request and
      refund the redemption.
    * **Prune duel requests**: Cancels requests involving fighters that are
      not in the game anymore (either as requestors or targets) and refunds
      associated redemptions.
* Duel settings
  * **Delay between attacks**: Adds a delay (in milliseconds) between attacks
    during a duel. Useful when inserting commentary during duels.
  * **Auto prune after duel**: Automatically prune duel requests after each
    duel.
  * **Auto start battles**: Automatically start duels instead of manually
    starting requests.
  * **Auto start duel delay**: Delay (in milliseconds) before auto-starting
    the next duel.
  * **Control duels from Twitch Rewards Requests Queue**: Allow control of
    duel requests via Twithc's Rewards Requests Queue panel.
  * **Chance attack: Normal/Crit/Miss**: Adjust weights for weighted RNG of
    chance for a normal hits, critical hits, or misses. It does not have to
    add up to 100 or any number, and can even be decimals. Example: Setting
    the chances to 10/10/10, which adds up to 30, gives each type a 1/3
    chance to happen.
  * **Weapon damage boost**: Add a damage boost when a fighter redeems the
    "equip weapon" reward.

## Rewards tab

Manage reward settings and redemption log.

Reward actions (shown in **Missing Rewards** and **Reward Map**):

* **add**: add viewer as fighter.
* **duel**: Request a duel with random fighter.
* **duelSomeone**: Request a duel with requested fighter.
* **weaponize**: Equip fighter with a weapon.
* **changeCharacterType**: Change fighter's character type (only used if using
  reward to change type).
* **changeCharacterGender**: Change fighter's gender (only used if using
  reward to change gender).
* **runAround**: Make fighter run around in game.
* **dance**: Make fighter dance.

Missing Rewards panel (only shown when there are missing reward mappings)

* **Create reward**: Show the "Create Reward" panel. This will initially be
  pre-filled with default settings.
  * **Title**: The reward's title shown in the Channel Points Store.
  * **Cost**: Cost of reward in channel points.
  * **Prompt**: Prompt/description of reward, shown when reward is chosen
    before redeeming.
  * **User Input Required**: Optionally requests user to enter a message.
    Used by the `duelSomeone`, `changeCharacterType`, and
    `changeCharacterGender` rewards.
  * **Cancel**: Closes the "Create Reward" panel.
  * **Create**: Creates the reward and maps to reward action.
* **Use Existing**: Shows the "Use Existing" panel, which lists all the
  existing rewards you already have.
    * **Select**: Maps this reward to the reward action.

Reward Map panel (shows currently mapped rewards):

* **Unset**: Unsets the mapping for this reward action.

Character Settings panel:

* **Change Gender Method**: Method to change gender.
  * **Chat**: Change gender via typing `!gender [male/female]` in chat.
    Enabling this automatically disables the associated reward (removes from 
    channel points store).
  * **Reward**: Change gender via reward redemption. Enabling this
    automatically enables the associated reward (adds to channel points store).
* **Change Char Type Method**: Method to change character type.
  Typing `!chars`, `!characters`, or `!allchars` in chat will show available 
  types in chat.
  * **Chat**: Change type via typing `!char [type]` or `!character [type]` in
    chat. Enabling this automatically disables the associated reward (removes 
    from channel points store).
  * **Reward**: Change type via reward redemption. Enabling this
    automatically enables the associated reward.

Redemptions panel: redemption log.

## Sounds tab

Change global volume and individual sound type volumes. You can change via
slider or the text box (0-100).

* **globalVolume**: Global volume for all sounds.
* **music**: Volume for duel music.
* **arena**: Volume for arena's rising and falling sound.
* **win**: Volume for end of duel.
* **spawn**: Volume for fighter spawn.
* **attacks**: Volume for attack sounds during duel.

## Debug tab

Some debug functions.

* **Auto refund**: Automatically refund all redemptions, even if successful
  or approved. Useful for testing with viewers, they just need to be able
  afford it.
* **Add debug player**: Adds a mock fighter in game (same function as
  **Add debug player** button in **Players** tab/panel).
* **Clear debug players**: Clears all mock fighter data.

# Miscellaneous

## `settings.json`

* **socketPort**: Port to use for communication between the server, control
  panel, and widget.
* **webPort**: Port to use for web interfaces such as Control Panel, Widget,
  and OAuth callbacks (if changed, must change all instances of
  `localhost:8080` to the new port).
* **staticDir**: Folder for built web files and for web server's static
  directory.
* **channelPointsName**: Channel points name (plural). Used in chat
  notifications.
* **sendChatForDebugEvents**: Send chat notifications for mock events such as
  mock duel requests and mock fighters. Normally, when false, mock events are
  not sent to chat.
* **commandPrefix**: Prefix for chat commands, such as `!char`. Default is
  `!`, can be changed to something else, such as `+` for the effect of
  `+char`.

## Spritesheet adjuster

Used to adjust positions of sprites of characters. Not needed for normal
functionality, but just needed to explain what `npm run server-debug` does.

Start with `npm run server-debug` then visit `http://localhost:8080`.

# Troubleshooting

## My local server is not receiving redeems!

Here are some things to try:

* Do you have ngrok installed and ran the `authtoken` command?
  * If not, [refer to these steps](#ngrok). (Something recently changed in the
    service that may require ngrok installation and an account recently)
* Try redeeming a channel points redemption that's not created by this project.
  Does the local server receive them in the console?
  * If they do, delete `.rewardmap.json`, delete the project-created
    redemptions in Twitch Dashboard > Viewer Rewards > Channel Points >
    Manage Rewards and Challenges, and recreate the rewards via the Rewards tab
    in the Control Panel.
  * If not, delete `.usertokens.json` and `.appsecrets.json` and go through the
  ["Your Computer" setup](#your-computer) again.

## The reward mappings in the Reward Tab are showing "Unknown"

This is a known bug with setting up the project for the first time, during
the authorizing stages in the Control Panel. To fix, just refresh the
Control Panel web page.

## Any other issues?

[Create an issue here](https://github.com/jayther/hackathon-overlay-minigame/issues)!

# Credits

* **Creator**: Jayther
* **Twitch JS Library**: [Twitch.js](https://github.com/d-fischer/twitch) by d-fischer (License: [MIT](https://github.com/d-fischer/twitch/blob/main/LICENSE))
* **Fighter Graphics**: [Medieval Fantasy Characters](https://cleancutgames.itch.io/pixelart-fantasy-characters) by CleanCutGames (Public License: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/))
* **Arena Graphics**: [HUGE pixelart asset pack](https://s4m-ur4i.itch.io/huge-pixelart-asset-pack) by s4m-ur4i (Public License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
* **HP Bar Graphics**: [Kenney.nl](https://kenney.nl/) (License: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/))
* **Music and SFX**: [8-bit Action Music & SFX](https://joelsteudler.itch.io/8-bit-action-music-sfx) by Joel Steudler
* **Control Panel Style**: [Bootstrap](https://getbootstrap.com/) (License: [MIT](https://github.com/twbs/bootstrap/blob/v4.0.0/LICENSE))

Note: The license for this project does not apply for the libraries and assets
used. Some assets are purchased for use. Please refer to their licenses.
