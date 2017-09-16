
# Template string for render msg to <li>
# variables: from, to, text, pathuuid, filename, time
module.exports.msg_li_tpl = """
            <li><span class="glyphicon glyphicon-leaf"></span> 
                <span class="username">{{{ from }}} </span>
                <i class="fa fa-arrow-right"></i>
                <span class="username">{{{ to }}} </span>:

                <ul class="file-info list-unstyled">
                    <li><div class="well message ">
                            {{{ text }}}
                    </div></li>

                    <li>
                        <input type="checkbox" name="filepath[]"
                            value="{{{ pathuuid }}}" />
                        <a href="/fileinfo-pathuuid/{{{ pathuuid }}}" class="file-info-link">
                                {{{ filename }}}
                        </a>
                    </li>
                    <li>{{{ date }}}</li>
                </ul>

            </li>
        """

module.exports.msg_li_2015 = """
            <li><span class="glyphicon glyphicon-leaf"></span> 
                <span class="username">{{{ from }}} </span>
                <span class="glyphicon glyphicon-send"></span>
                <span class="username">{{{ to }}} </span>:

                <ul class="file-info list-unstyled">
                    <li><div class="well message ">
                            {{{ text }}}
                    </div></li>

                    <li>
                        <input type="checkbox" name="filepath[]"
                            value="{{{ pathuuid }}}" />
                        <a href="/fileinfo-pathuuid/{{{ pathuuid }}}" class="file-info-link">
                                {{{ filename }}}
                        </a>
                    </li>
                    <li>Fri Jul 10 2015 06:43:38 GMT+0000 (UTC)</li>
                </ul>

            </li>
        """
