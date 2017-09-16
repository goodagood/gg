
def main(info):
    asked  = info['ask-for']
    info['2plus2'] = 'done by py'
    info[asked] = 4
    return info

