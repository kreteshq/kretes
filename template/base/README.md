# README

## Getting Started

### Using VS Code (Recommended)

Use the `Start` command from <kbd>Tasks: Run Task</kbd> in menu in the command palette. This command will trigger
two processes: the server and the client. You can quickly switch between them using a select field at the top of the 
terminal window in VS Code.

> It is a good idea to bind CTRL-T to Tasks: Run Task for convenience.

![Kretes Start](https://kretes.dev/images/external/kretes-readme.gif)

You can also start Kretes `Server` and `Client` tasks from <kbd>Tasks: Run Task</kbd> menu in Command Palette.

To start debugging in VSCode select one of the configurations in Run and Debug menu or select <kbd>Debug: Start Debugging</kbd> in Command Palette.

### Using CLI

Install dependencies

```
npm install
```

Start the server:

```
kretes start
```

Start the client (the asset compilation via a Rollup process):

``` 
kretes client
```

and go to [localhost:554](http://localhost:5544) to see the application running


