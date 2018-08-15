<a name="IpcClient"></a>

## IpcClient
IPC connection client helper

**Kind**: global class  

* [IpcClient](#IpcClient)
    * [.connect()](#IpcClient+connect)
    * [.ping()](#IpcClient+ping)
    * [.call(data)](#IpcClient+call)
    * [._handleCall()](#IpcClient+_handleCall)

<a name="IpcClient+connect"></a>

### ipcClient.connect()
**Kind**: instance method of [<code>IpcClient</code>](#IpcClient)  
<a name="IpcClient+ping"></a>

### ipcClient.ping()
Send an extra ping to the server, you probably don't need to call this.

**Kind**: instance method of [<code>IpcClient</code>](#IpcClient)  
<a name="IpcClient+call"></a>

### ipcClient.call(data)
Transmit a `call` message to the ipc server

**Kind**: instance method of [<code>IpcClient</code>](#IpcClient)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | the message content |

<a name="IpcClient+_handleCall"></a>

### ipcClient._handleCall()
**Kind**: instance method of [<code>IpcClient</code>](#IpcClient)  
