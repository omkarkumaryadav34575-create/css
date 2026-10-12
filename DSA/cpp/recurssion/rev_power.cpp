#include <iostream>
using namespace std;
int f(int n,int pow){
    if (n==0)
    return pow;
    int digit=n%10;
    int rev= rev*10+digit;
    return f(n/10,rev);

}
int main(){
    int n;cin>>n;
    cout<<f(n,0);
    return 0;
}