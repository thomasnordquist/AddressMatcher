class RegexMatcher {
  constructor(regex) {
    this.regex = regex
  }

  match(str) {
    const match = str.match(this.regex.regex)
    if (!match) return undefined

    if (!isNaN(this.regex.group)) {
      return match[this.regex.group]
    }

    const obj = {}
    Object.keys(this.regex.group).forEach((key) => {
      obj[key] = match[this.regex.group[key]]
    })
    return obj
  }
}

module.exports = RegexMatcher
