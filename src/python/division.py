import sys

# get args from command line
a = int(sys.argv[1])
b = int(sys.argv[2])

# perform division
result = a / b

# print result
print(result)

# since it will be executed in a sandbox, we need to flush the output
sys.stdout.flush()