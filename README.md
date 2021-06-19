# Invisible Chat

This is a message encrypter for [Powercord](https://github.com/powercord-org/powercord "Powercord Website")

## Install Me

First `cd` into your powercord plugin directory, then
the folder you want to clone into is

```txt
powercord/src/Powercord/plugins
```

then run this:

```console
git clone https://github.com/SammCheese/invisible-chat
```

## How I work

### Command `invichat`

*Usage* (Encryption)

```txt
.invichat -m [hidden message] -c [camo message] -p [password]
```

*Usage* (Decryption)

```txtt
.invichat -s [encrypted message] -p [password]
```

### GUI Explanation

```txt
The Lock Icon in the Chatbar can be used to open a GUI to Encrypt Messages.

The "Secret Message" Textbox will be the Text you want to hide.
The "Message Cover" Textbox will be the Text Visible for Others. (Must be more than one word)
The "Encryption Password" Textbox will be the Password the other person needs to use to Decrypt your Encrypted Message

You can set Userspecific Passwords in your Plugin Settings which then can be Selected in the Encryption GUI.
```

## Contributing

Please look at the [todo readme](TODO.md) for things you can do to help!

## Credits

This Wouldnt have been Possible without [c0dine](https://github.com/c0dine) doing the Base
<https://github.com/c0dine/invisible-chat>

Thank You!
