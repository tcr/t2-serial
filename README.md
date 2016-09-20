# t2-serial

Directly opens a terminal into Tessel 2's serial port shell (over USB).
Works on Windows, macOS, and Linux.

```sh
npm install -g t2-serial
```

then:

```sh
$ t2-serial
INFO Connecting to Tessel...
Please press Enter to activate this console.


BusyBox v1.23.2 (2016-09-02 15:27:43 EDT) built-in shell (ash)

Tessel 2  /  Built on OpenWrt
root@Tessel-02A34C9AB2FE:/# echo hi
hi
root@Tessel-02A34C9AB2FE:/#
```

## License

MIT or Apache-2.0, at your option.
