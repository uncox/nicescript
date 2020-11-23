<render name="sample">
  <h1>Hello Worlds</h1>
  <span class="class1 {test()} class2">{test()}</span>
  <xlink text="CLICK HERE" href="bbbb">aaaaaaaa</xlink>
  <span class="">THIS WONT UPDATE</span>
  <span>{count()}</span>
  <ul>{tags()}</ul>
</render>

function tags() {
  let items = [];
  $.each(data.tags, function() {
    console.log(this);
    items.push('<li>' + this + '</li>');
  });

  return items.join(' ');
}

function test() {
  return data.host;
}

function count() {
  return data.tags.length;
}
