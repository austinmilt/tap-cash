eventually I'd suggest describing your tests in a more systematic way. I do like

"initialize_bank - all good - bank authority is the ???" (not sure what goes in ???)
This helps to understand what specific things are being tested and the conditions that should cause the test to result in the way you expect. It also causes you to write more specialized tests, which helps when tracking down bugs. For instance, you could (not saying you need to) break this into 3 tests:

"initialize_bank - all good - bank authoritiy is the ???"
"initialize_bank - all good - bank initialized field is true"
"initialize_bank - all good - bank bump matches instruction args"
And then that points out the unhappy-path cases you should be testing, e.g.

"initialize_bank - authority is not ??? - throws IncorrectAuthority exception"
"initialize_bank - wrong bump - throws ??? exception"
"initialize_bank - attempt to reinitialize an existing bank - throws ??? exception"
etc etc

Think of finally as being something that you run even when the try/catch block is going to cause premature exit of the method (i.e. stuff after the try/catch block wont run). In this case (as others), you are swallowing errors, so the stuff after the try/catch block will run anyway. So, you dont need finally

When writing test assertions, try to use the more specific utilities that come with the testing library. In this case, I think you can replace all of these with assert.strictEqual. See https://www.chaijs.com/api/assert/