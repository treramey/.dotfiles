function __dotfiles_fzf_cd_tab -d "Select a directory with fzf and execute cd"
    set -l buffer (commandline --current-buffer | string collect)
    set -l tokens
    printf '%s\n' "$buffer" | read --tokenize --array tokens

    # Never auto-execute compound commands or a cd with additional arguments.
    if test "$tokens[1]" != cd; or test (count $tokens) -gt 2; or test "$buffer" != (commandline --current-process | string collect)
        commandline --function complete
        return
    end

    set -l completion "$buffer"
    if test (count $tokens) -eq 1
        set completion 'cd '
    end
    set -l directory (
        complete --do-complete="$completion" --escape \
        | string split --fields 1 \t \
        | string unescape \
        | string replace --regex '^~/' "$HOME/" \
        | path filter --type dir \
        | _fzf_wrapper $fzf_directory_opts --no-multi --exit-0 \
            --prompt='Directory> ' --preview='_fzf_preview_file {}'
    )
    set -l picker_status $status

    # Cancellation must not execute even an already-complete directory token.
    if test $picker_status -eq 0; and test (count $directory) -eq 1
        commandline --replace -- "cd -- "(string escape -- "$directory")
        commandline --function execute
    else
        commandline --function repaint
    end
end

if status is-interactive
    for mode in default insert
        bind --mode $mode \t __dotfiles_fzf_cd_tab
    end
end
