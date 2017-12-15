class RegexTester {
  static testRegex(regex) {
    console.log('Performing self-test', regex.regex)
    Object.keys(regex.positive).forEach((testStr) => {
      const expected = regex.positive[testStr]
      const match = testStr.match(new RegExp(regex.regex))

      if (!match) {
        throw `Positive test failed for "${testStr}" matched "${match}"`
      } else if (typeof regex.group !== 'number') {
        Object.keys(expected).forEach((key) => {
          const subExpect = expected[key]
          const val = match[regex.group[key]]
          if (val !== subExpect) {
            throw `Positive test failed for "${subExpect}" matched "${match}"`
          }
        })
      } else if (match[regex.group] !== expected) {
        throw `Positive test failed for "${testStr}" matched "${match}"`
      } else {
        // console.log('')
      }
    })

    regex.negative.forEach((testStr) => {
      const match = testStr.match(new RegExp(regex.regex))
      if (match) {
        throw `Negative test failed for "${testStr}" matched "${match}"`
        // fail
      }
    })
  }
}

module.exports = RegexTester
