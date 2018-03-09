// BEGIN MY CODEZ
const matchNoNull = (toMatch, regex, skipFirstN=1) => {
  const a = toMatch.match(regex);
  console.log('after match', a);
  return (a === null) ? [] : a.slice(skipFirstN);
};

const getId = (selector) => matchNoNull(selector, /#([a-zA-Z-_]*|\w+)/)[0];
const getClasses = (selector) => matchNoNull(selector, /(?:\.)([-_\w]+|[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}])/ug, 0).map((str) => str.replace('.', ''));
const getName = (selector) => matchNoNull(selector, /\[name\=\"([a-zA-Z-_]*|\w+)\"\]/);
const getTagName = (selector) => matchNoNull(selector, /(?:^|\W)(h1|h2|h3|input|a|li|div|form)(?:\W|$)/);

const getElementsForClassesAsArray = (classes, root) => Array.from(root.getElementsByClassName(classes));
const getElementsForNameAsArray = (name) => Array.from(sandboxDocument.getElementsByName(name));
const getElementsForTagNameAsArray = (tagName, root) => Array.from(root.getElementsByTagName(tagName));

function parseSelectorComponent(component, root) {
  return {
    id: sandboxDocument.getElementById(getId(component)),
    classNames: getElementsForClassesAsArray(getClasses(component).join(' '), root),
    name: getElementsForNameAsArray(getName(component)),
    tagName: getElementsForTagNameAsArray(getTagName(component), root)
  };
}

const intersect = (a, b = a, ...rest) => {
  if (rest.length === 0) return [...new Set(a)].filter(x => new Set(b).has(x));
  return intersect(a, intersect(b, ...rest));
};

function getMatchesForComponent(component, root) {
  const parsedSelector = parseSelectorComponent(component, root);

  if (parsedSelector.id) return [parsedSelector.id];

  return intersect(...[
    parsedSelector.classNames,
    parsedSelector.name,
    parsedSelector.tagName
  ].filter((elArr) => elArr.length));
};

function getMatchesForDirectChild(parent, child, root) {
  const aMatches = getMatchesForComponent(parent, root);
  const bMatches = getMatchesForComponent(child, root);
  return bMatches.filter((bMatch) => aMatches.indexOf(bMatch.parentElement) !== -1)
}

function querySelectorAll(selector) {
  let rootSet = [sandboxDocument];

  selector = selector.replace(/\s\>\s/g, '>'); // ditch the spaces around '>'

  const childOfComponents = selector.split(' ');
  return childOfComponents.reduce((rootSet, component) => {
    const directChild = component.split('>');

    return rootSet.reduce((newRootSet, rootNode) => [
      ...newRootSet,
      ...(directChild.length > 1) ?
        getMatchesForDirectChild(...directChild, rootNode) : getMatchesForComponent(component, rootNode)
    ], []);
  }, [sandboxDocument]);
}
