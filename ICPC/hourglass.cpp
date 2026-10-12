#include <iostream>
using namespace std;
int main(){
    int n;
    cin>>n;
    for(int i=1;i<=n;i++){
        //space
        for(int k=1;k<=i-1;k++){
         cout<<" ";
        }
        //star
        for (int j=1;j<=2*n-1;j++){
            cout<<"*";
        }
        
        
        cout<<endl;
    }
    return 0;
}