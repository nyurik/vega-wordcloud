var tape = require('tape'),
    util = require('vega-util'),
    vega = require('vega-dataflow'),
    wordcloud = require('../');

tape('Wordcloud registers transforms', function(test) {
  test.equal(wordcloud.transform, vega.transform);
  test.equal(wordcloud.definition, vega.definition);
  test.end();
});

tape('Wordcloud generates wordcloud layout', function(test) {
  var data = [
    {text: 'foo', size: 49, index: 0},
    {text: 'bar', size: 36, index: 1},
    {text: 'baz', size: 25, index: 2},
    {text: 'abc', size:  1, index: 3}
  ];

  var text = util.field('text'),
      size = util.field('size'),
      df = new vega.Dataflow(),
      rot = df.add(null),
      c0 = df.add(vega.transforms.Collect),
      wc = df.add(vega.transforms.Wordcloud, {
        size: [500, 500],
        text: text,
        fontSize: size,
        fontSizeRange: [1, 7],
        rotate: rot,
        pulse: c0
      });

  var angles = [0, 30, 60, 90];
  rot.set(function(t) { return angles[t.index]; });

  df.pulse(c0, vega.changeset().insert(data)).run();
  test.equal(c0.value.length, data.length);
  test.equal(wc.stamp, df.stamp());

  for (var i=0, n=data.length; i<n; ++i) {
    test.ok(data[i].x != null && !isNaN(data[i].x));
    test.ok(data[i].y != null && !isNaN(data[i].y));
    test.equal(data[i].font, 'sans-serif');
    test.equal(data[i].fontSize, Math.sqrt(data[i].size));
    test.equal(data[i].fontStyle, 'normal');
    test.equal(data[i].fontWeight, 'normal');
    test.equal(data[i].angle, angles[i]);
  }

  test.end();
});