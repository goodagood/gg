
get_footer = ()->
    """
        <div class="row-fluid footer">
                <p class="text-center"> goodogood, goodagood, Andrew &reg; &copy;  <p>
        </div>
    """

module.exports.get_footer = get_footer


foot_with_buttons = """
    
    <div class="row-fluid footer">
        <div class="buttons">
            <a href="/file/md-with-local-files/intro/public/intro.md" class="button"> Background</a>
            <a class="button" href="/logout"> Logout </a>
        </div>
        <p>
            goodogood, goodagood, Andrew, &copy; 
        </p>
    </div>

    """
module.exports.foot_with_buttons = foot_with_buttons
