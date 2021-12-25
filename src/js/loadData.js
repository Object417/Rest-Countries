const Storage = {
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  get: key => JSON.parse(localStorage.getItem(key))
}

const loadData = url => fetch(url).then(data => data.json())

export { Storage, loadData }