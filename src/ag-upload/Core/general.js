
export function createElem(name) {
  const elem = document.createElement(name);
  elem.style.display = 'block';
  document.querySelector('body').appendChild(elem);
  return elem;
}

export function getExtension(filename) {
  const extension = filename.substring(filename.lastIndexOf('.') + 1);
  return extension;
}

export function getFilenameFromURL(URL) {
  const filename = URL.substring(URL.lastIndexOf('/') + 1);
  return filename;
}

export function getEnvironmentFromExtension(extension) {
  let environment;
  if (extension == 'agg') {
    environment = 'Grandeurs';
  } else if (extension == 'agt') {
    environment = 'Tangram';
  } else if (extension == 'agc') {
    environment = 'Cubes';
  } else if (extension == 'agl') {
    environment = 'Geometrie'
  } else {
    console.error('wrong extension :', extension);
  }
  return environment;
}
