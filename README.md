The idea behind this parse is good testability.
The regular expression which parses the complete address is assembled from many small expressions.
Each partial expression itself is tested, assembled to bigger expressions and tested again.
With test dataset of approximatly 10.000 texts > 99,x% positive matches were achieved.

### Run 
`node AddressRegex.js`
