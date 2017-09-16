#!/bin/sh
# http://stackoverflow.com/questions/10845051/git-show-total-file-size-difference-between-two-commits

. git-sh-setup
args=$(git rev-parse --sq "$@")
eval "git diff-tree -r $args" | {
    total=0
    while read A B C D M P
    do
        case $M in
            M) bytes=$(( $(git cat-file -s $D) - $(git cat-file -s $C) )) ;;
            A) bytes=$(git cat-file -s $D) ;;
            D) bytes=-$(git cat-file -s $C) ;;
            *)
                echo >&2 warning: unhandled mode $M in \"$A $B $C $D $M $P\"
                continue
                ;;
        esac
        total=$(( $total + $bytes ))
        printf '%d\t%s\n' $bytes "$P"
    done
    echo total $total
}

# or, ref to another online example
# https://github.com/matthiaskrgr/gitdiffbinstat/blob/master/gitdiffbinstat.sh
