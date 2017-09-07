class IntervalCache {
  constructor(interval) {
    if (!Number.isInteger(interval)) throw new Error('Invalid interval')
    this.interval = interval
    this.container = new Map
    setInterval(() => {
      this.container.clear()
    }, interval)
  }

  has(key) {
    return this.container.has(key)
  }

  set(key, value) {
    this.container.set(key, value)
  }

  get(key) {
    return this.container.get(key)
  }
}

module.exports = IntervalCache