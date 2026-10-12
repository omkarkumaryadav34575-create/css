#include <iostream>
using namespace std;
int f(int n,int rev){
    if (n==0)
    return rev;
    int digit=n%10;
    rev= rev*10+digit;
    return f(n/10,rev);

}
int main(){
    int n;cin>>n;
    cout<<f(n,0);
    return 0;
}