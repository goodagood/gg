
sample = """
<li class="file image" data-path="path/to/file.ext">
    <span class="thumb">
        <a class="thumb" href="path/to/show/thumb-img">
            <img src="smiley.gif" alt="Smiley face" height="80" width="80">
        </a>
    </span>

    <!--{name_part} -->
    <span class="name">
        <a class="filename" href="path/of/file-name/click">
            file name.extension
        </a>
    </span>

    {size_span}
    <span class="size" data-size="9876...0">
    </span>

    {type_span}
    {time_span}
    {thum_span}
    {owner_span}
    {permission_span}
</li>
"""
