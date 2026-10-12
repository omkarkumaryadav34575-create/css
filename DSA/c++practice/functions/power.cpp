#include <iostream>
using namespace std;
long long powr(int x,int y)
{long long ans =1;
for (int i=1;i<=y;i++) ans*=x;
return ans;
}