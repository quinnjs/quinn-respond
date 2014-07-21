# quinn: respond

## API 

### `respond({ statusCode, headers, body })`

Create a new `QuinnResponse`.
The body can be a string or a buffer.
If no body is provided, it defaults to a through stream.

### QuinnResponse

#### `.pipe(res)`

Forward response to node http response.
If you pipe to something that isn't an HTTP response,
this will only forward the response body and return a wrapped result.
This enables things like:

```js
function handle(req, res) {
    fs.createReadStream('README.md')
        .pipe(respond.text())
        .pipe(toUpperCase()) // pipe the body through a transform stream
        .pipe(res); // headers etc. are preserved
}
```

The minimum requirement for something to be seen as an HTTP response
is the presence of a `setHeader` method.

### Helpers

#### `respond.text(body)`

Create a `text/plain` response with the given body.
The body can be a string or a buffer.
If no body is provided, it defaults to a through stream.

#### `respond.html(body)`

Create `text/html` response with the given body.
The body can be a string or a buffer.
If no body is provided, it defaults to a through stream.
