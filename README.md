# quinn: respond

## API 

### `respond(body | { statusCode, headers, body })`

Create a new `QuinnResponse`.
The body can be a string, a buffer, or a stream.
If no body is provided, it defaults to a through stream.

See the test directory for usage examples.

### QuinnResponse

#### `.pipe(res)`

Forward response to node http response.

The minimum requirement for something to be seen as an HTTP response
is the presence of a `setHeader` method.

### Helpers

#### `respond.text(body | { statusCode, headers, body })`

Same as `respond` but sets a `text/plain` content type.

#### `respond.html(body | { statusCode, headers, body })`

Same as `respond` but sets an `text/html` content type.

#### `respond.json(data, visitor, indent)`

Serialize the data and create an `application/json` response.
